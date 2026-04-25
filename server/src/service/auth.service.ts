import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { db } from "../database/supabase";
import { users } from "../database/drizzle/schema";
import { eq } from "drizzle-orm";
import { RegisterInput, LoginInput } from "../models/auth.model";

const SALT_ROUND = 10;
const ACCESS_TOKEN_EXP  = 60 * 15;
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 7;

//create JWT
const generateTokens = (userId: string) => {
    const access_token = jwt.sign(
        { sub: userId },
        process.env.JWT_SECRET!,
        { expiresIn: ACCESS_TOKEN_EXP }
    );
    const refresh_token = jwt.sign(
        { sub: userId },
        process.env.JWT_SECRET!,
        { expiresIn: REFRESH_TOKEN_EXP }
    );
    return { access_token, refresh_token };
};

//Register Logic
export const registerUser = async (input: RegisterInput) => {

    //check duplicate email and username
    const existingEmail = await db.select().from(users)
        .where(eq(users.email, input.email)).limit(1);
    if (existingEmail.length > 0) {
        throw { status: 409, error_code: "CONFLICT", message: "Email already exists" };
    }

    const existingUsername = await db.select().from(users)
        .where(eq(users.username, input.username)).limit(1);
    if (existingUsername.length > 0) {
        throw { status: 409, error_code: "CONFLICT", message: "Username already exists" };
    }

    //hash password before stored
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUND);

    //cal BMR (Mifflin-St Jeor)
    const bmr = input.sex === "male"
        ? Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age + 5)
        : Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age - 161);

    //insert user to db
    const [newUser] = await db.insert(users).values({
        username:    input.username,
        email:       input.email,
        password:    hashedPassword,
        fitnessGoal: input.fitness_goal,
        sex:         input.sex,
        age:         input.age,
        weight:      input.weight,
        height:      input.height,
        bmr:         bmr,
    }).returning();

    const tokens = generateTokens(newUser.id);

    return {
        ...tokens,
        user: {
            id:           newUser.id,
            username:     newUser.username,
            email:        newUser.email,
            bmr:          newUser.bmr,
            member_since: newUser.memberSince,
        }
    };
};

//Login Logic
export const loginUser = async (input: LoginInput) => {

    const [user] = await db.select().from(users)
        .where(eq(users.email, input.email)).limit(1);
    if (!user) {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid email or password" };
    }

    const tokens = generateTokens(user.id);

    return {
        ...tokens,
        user: {
            id:           user.id,
            username:     user.username,
            email:        user.email,
            bmr:          user.bmr,
            member_since: user.memberSince,
        }
    };
};

//Refresh Token
export const refreshToken = async (token: string) => {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        const access_token = jwt.sign(
            { sub: (payload as any).sub },
            process.env.JWT_SECRET!,
            { expiresIn: ACCESS_TOKEN_EXP }
        );
        return { access_token };

    } catch {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid or expired token" };
    }
};

//Logout
export const logoutUser = async () => {
    return { message: "Logged out successfully" };
};