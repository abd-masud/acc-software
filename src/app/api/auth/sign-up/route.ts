import { hash } from 'bcryptjs';
import { ResultSetHeader } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { connectionToDatabase } from '@/util/db';
import { ExistingUserResult, User } from '@/types/sign-up';

export async function POST(request: NextRequest) {
    try {
        const { name, last_name, email, contact, company, address, role, password } = await request.json();

        // Validate input fields
        if (!name || !last_name || !email || !contact || !company || !address || !role || !password) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Hash password before saving it to the database
        const hashedPassword = await hash(password, 10);
        const db = await connectionToDatabase();

        // Check if the user already exists
        const [existingUser] = await db.query<ExistingUserResult[]>(
            `SELECT COUNT(*) AS count FROM user WHERE email = ?`,
            [email]
        );

        // If email already exists, return a conflict response
        if (existingUser[0]?.count > 0) {
            return NextResponse.json(
                { success: false, message: "Email already exists" },
                { status: 409 }
            );
        }

        // Insert the new user into the database
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO user (name, last_name, email, contact, company, address, role, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, last_name, email, contact, company, address, role, hashedPassword]
        );

        // Check if the insertion was successful
        if (result.affectedRows !== 1) {
            throw new Error('Failed to insert user');
        }

        return NextResponse.json(
            { success: true, message: 'User registered successfully' },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { message: 'Failed to register user' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const db = await connectionToDatabase();
        const [user] = await db.query<User[]>("SELECT * FROM user");

        return NextResponse.json(user, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        // Validate input fields
        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Delete the user from the database
        const db = await connectionToDatabase();
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM user WHERE id = ?",
            [id]
        );

        // If no rows were affected, return a not found response
        if (result.affectedRows == 0) {
            return NextResponse.json(
                { error: "No user found with the specified ID" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
