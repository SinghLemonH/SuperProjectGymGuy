import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { db } from "../database/supabase";
import { sql } from "drizzle-orm";
import { RegisterInput, LoginInput } from "../models/auth.model";

const SALT_ROUND = 10;
const ACCESS_TOKEN_EXP  = 60 * 15;
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 7;

// create JWT
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

// Register Logic
export const registerUser = async (input: RegisterInput) => {

    // check duplicate email
    const existingEmail = await db.execute(sql`
        SELECT id FROM users
        WHERE email = ${input.email}
        LIMIT 1
    `);
    if (existingEmail.rows.length > 0) {
        throw { status: 409, error_code: "CONFLICT", message: "Email already exists" };
    }

    // check duplicate username
    const existingUsername = await db.execute(sql`
        SELECT id FROM users
        WHERE username = ${input.username}
        LIMIT 1
    `);
    if (existingUsername.rows.length > 0) {
        throw { status: 409, error_code: "CONFLICT", message: "Username already exists" };
    }

    // hash password before stored
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUND);

    // cal BMR (Mifflin-St Jeor)
    const bmr = input.sex === "male"
        ? Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age + 5)
        : Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age - 161);

    // insert user to db
    const result = await db.execute(sql`
        INSERT INTO users (username, email, password, fitness_goal, sex, age, weight, height, bmr)
        VALUES (
            ${input.username},
            ${input.email},
            ${hashedPassword},
            ${input.fitness_goal},
            ${input.sex},
            ${input.age},
            ${input.weight},
            ${input.height},
            ${bmr}
        )
        RETURNING id, username, email, bmr, member_since
    `);
    const newUser = result.rows[0] as any;

    const tokens = generateTokens(newUser.id);

    return {
        ...tokens,
        user: {
            id:           newUser.id,
            username:     newUser.username,
            email:        newUser.email,
            bmr:          newUser.bmr,
            member_since: newUser.member_since,
        }
    };
};

// Login Logic
export const loginUser = async (input: LoginInput) => {

    const result = await db.execute(sql`
        SELECT id, username, email, password, bmr, member_since
        FROM users
        WHERE email = ${input.email}
        LIMIT 1
    `);

    const user = result.rows[0] as any;

    if (!user) {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid email or password" };
    }

    // check password with hash in db
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
            member_since: user.member_since,
        }
    };
};

// Refresh Token
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

// Logout
export const logoutUser = async () => {
    return { message: "Logged out successfully" };
};