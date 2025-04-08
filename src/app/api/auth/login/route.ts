import { connectionToDatabase } from '@/util/db';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';

const SECRET_KEY = process.env.SECRET_KEY as string;
if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
}

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const requestBody = await request.json();

        // Check if email and password are provided
        if (!requestBody.email || !requestBody.password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const db = await connectionToDatabase();

        // Check if the user exists in the database
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM `user` WHERE `email` = ?',
            [requestBody.email]
        );

        if (rows.length == 0) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = rows[0];

        // Validate the password
        const isPasswordValid = await compare(requestBody.password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, name: user.name, last_name: user.last_name, email: user.email, contact: user.contact, company: user.company, logo: user.logo, address: user.address, role: user.role, image: user.image },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Send back the token and user data
        const userData = {
            id: user.id, name: user.name, last_name: user.last_name, email: user.email, contact: user.contact, company: user.company, logo: user.logo, address: user.address, role: user.role, image: user.image
        };

        return new Response(
            JSON.stringify({ token, user: userData }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch {
        // Return error if authentication fails
        return new Response(
            JSON.stringify({ error: 'Failed to authenticate user' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
