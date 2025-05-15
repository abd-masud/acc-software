import { connectionToDatabase } from '@/util/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new purchaser
export async function POST(request: NextRequest) {
    try {
        const { user_id, purchaser_id, company, owner, address, email, contact } = await request.json();

        // Basic validation
        if (!user_id || !purchaser_id || !company || !owner || !address || !email || !contact) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Insert new purchaser
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO purchasers (user_id, purchaser_id, company, owner, address, email, contact)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, purchaser_id, company, owner, address, email, contact]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Purchaser created successfully',
                    purchaserId: result.insertId
                },
                { status: 201 }
            );
        } else {
            throw new Error('Failed to create purchaser');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create purchaser'
            },
            { status: 500 }
        );
    }
}

// GET - Retrieve purchasers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

        // If purchaser ID is provided
        if (user_id) {
            const [purchasers] = await db.query<RowDataPacket[]>(
                `SELECT * FROM purchasers WHERE user_id = ?`,
                [user_id]
            );

            if (purchasers.length == 0) {
                return NextResponse.json(
                    { success: false, message: "Purchaser not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: purchasers },
                { status: 200 }
            );
        }

        // If no purchaser ID provided, fetch all purchasers
        const [purchasers] = await db.query<RowDataPacket[]>(
            `SELECT * FROM purchasers`
        );

        return NextResponse.json(
            { success: true, data: purchasers },
            { status: 200 }
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT - Update a purchaser
export async function PUT(request: NextRequest) {
    try {
        const { id, purchaser_id, company, owner, address, email, contact } = await request.json();

        const db = await connectionToDatabase();

        // Check if purchaser exists
        const [existingPurchaser] = await db.query<RowDataPacket[]>(
            `SELECT * FROM purchasers WHERE id = ?`,
            [id]
        );

        if (existingPurchaser.length == 0) {
            return NextResponse.json(
                { success: false, message: "Purchaser not found" },
                { status: 404 }
            );
        }

        // Update purchaser
        const [result] = await db.query<ResultSetHeader>(
            `UPDATE purchasers 
             SET purchaser_id =?, company = ?, owner = ?, address = ?, email = ?, contact = ?
             WHERE id = ?`,
            [purchaser_id, company, owner, address, email, contact, id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                { success: true, message: 'Purchaser updated successfully' },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to update purchaser');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update purchaser'
            },
            { status: 500 }
        );
    }
}

// DELETE - Remove a purchaser
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Purchaser ID is required" },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Check if purchaser exists
        const [existingPurchaser] = await db.query<RowDataPacket[]>(
            `SELECT * FROM purchasers WHERE id = ?`,
            [id]
        );

        if (existingPurchaser.length == 0) {
            return NextResponse.json(
                { success: false, message: "Purchaser not found" },
                { status: 404 }
            );
        }

        // Delete purchaser
        const [result] = await db.query<ResultSetHeader>(
            `DELETE FROM purchasers WHERE id = ?`,
            [id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                { success: true, message: 'Purchaser deleted successfully' },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to delete purchaser');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete purchaser'
            },
            { status: 500 }
        );
    }
}