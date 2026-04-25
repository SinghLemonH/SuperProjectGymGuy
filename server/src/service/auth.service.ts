import { sign, verify } from "hono/jwt";
import * as bcrypt from "bcrypt";
import { db } from "../database/supabase";
import { users } from "../database/drizzle/schema";
import { eq } from "drizzle-orm";
import { RegisterInput, LoginInput} from "../models/auth.model"

const SALT_ROUND = 10; //for hash
const ACCESS_TOKEN_EXP = 60 * 15; // 15 min (second)
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 7 // 7days (second)

//create JWT
const generateTokens = async (userId: string) => {
    const now = Math.floor(Date.now() / 1000) //tran current time to second
    
    const access_token = await sign(
        { sub: userId, exp: now + ACCESS_TOKEN_EXP},
        process.env.JWT_SECRET!, "HS256"
    );

    const refresh_token = await sign(
        { sub: userId, exp: now + REFRESH_TOKEN_EXP},
        process.env.JWT_SECRET!, "HS256"
    );

    return { access_token, refresh_token};
}

//Register Logic
export const registerUser = async (input: RegisterInput) => {
    
    //check duplicate email and username
    const existingEmail = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existingEmail.length > 0) {
        throw { status: 409, error_code: "CONFLICT", message: "Email already exists" };
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
    if (existingUsername.length > 0) {
        throw { status: 409, error_code: "CONFLICT", message: "Username already exists" };
    }

    //hash password before stored
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUND);

    //cal BMR (Thm : Mifflin-St Jeor)
    const bmr = input.sex === "male"
        ? Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age + 5) //male
        : Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age - 161); //female

    // let bmr;
    // if (input.sex === "male") {
    //     bmr = Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age + 5)
    // } else {
    //     bmr = Math.round(10 * input.weight + 6.25 * input.height - 5 * input.age - 161)
    // }

    //insert user to db
    const  [newUser] = await db.insert(users).values({
        username:     input.username,
        email:        input.email,
        password:     hashedPassword,
        fitnessGoal: input.fitness_goal,
        sex:          input.sex,
        age:          input.age,
        weight:       input.weight,
        height:       input.height,
        bmr:          bmr,
    }).returning();

    //create JWT 
    const tokens = await generateTokens(newUser.id);

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
    //find user from email
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

    if(!user) {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid email or password"};
    }

    //check password with hash in db
    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid email or password" };
    }

    const tokens = await generateTokens(user.id);

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
        //verify refresh token
        const payload = await verify(token, process.env.JWT_SECRET!, "HS256");

        //release new access_token
        const now = Math.floor(Date.now() / 1000);
        const access_token = await sign(
            { sub: payload.sub, exp: now + ACCESS_TOKEN_EXP },
            process.env.JWT_SECRET!, "HS256"
        );

        return { access_token };

    } catch {
        throw { status: 401, error_code: "UNAUTHORIZED", message: "Invalid or expired token" };
    }
}

//Logout 
export const logoutUser = async () => {
    return { message: "Logged out successfully" }; //client will do itself
}