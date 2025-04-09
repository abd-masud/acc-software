import { connectionToDatabase } from '@/util/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new customer
export async function POST(request: NextRequest) {
    try {
        const { user_id, name, delivery, email, contact, remarks } = await request.json();

        // Basic validation
        if (!user_id || !name || !delivery || !email || !contact) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Insert new customer
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO customers (user_id, name, delivery, email, contact, remarks)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, name, delivery, email, contact, remarks]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Customer created successfully',
                    customerId: result.insertId
                },
                { status: 201 }
            );
        } else {
            throw new Error('Failed to create customer');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create customer'
            },
            { status: 500 }
        );
    }
}

// GET - Retrieve customers
export async function GET(request: NextRequest) {
    try {
        const db = await connectionToDatabase();
        const user_id = request.headers.get('user_id');

        // If customer ID is provided
        if (user_id) {
            const [customers] = await db.query<RowDataPacket[]>(
                `SELECT * FROM customers WHERE user_id = ?`,
                [user_id]
            );

            if (customers.length == 0) {
                return NextResponse.json(
                    { success: false, message: "Customer not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: customers },
                { status: 200 }
            );
        }

        // If no customer ID provided, fetch all customers
        const [customers] = await db.query<RowDataPacket[]>(
            `SELECT * FROM customers`
        );

        return NextResponse.json(
            { success: true, data: customers },
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

// PUT - Update a customer
export async function PUT(request: NextRequest) {
    try {
        const { id, name, delivery, email, contact, remarks } = await request.json();

        const db = await connectionToDatabase();

        // Check if customer exists
        const [existingCustomer] = await db.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE id = ?`,
            [id]
        );

        if (existingCustomer.length == 0) {
            return NextResponse.json(
                { success: false, message: "Customer not found" },
                { status: 404 }
            );
        }

        // Check if email is being used by another customer
        const [emailCheck] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count FROM customers WHERE email = ? AND id != ?`,
            [email, id]
        );

        if (emailCheck[0]?.count > 0) {
            return NextResponse.json(
                { success: false, message: "Email already in use by another customer" },
                { status: 400 }
            );
        }

        // Update customer
        const [result] = await db.query<ResultSetHeader>(
            `UPDATE customers 
             SET name = ?, delivery = ?, email = ?, contact = ?, remarks = ?
             WHERE id = ?`,
            [name, delivery, email, contact, remarks, id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                { success: true, message: 'Customer updated successfully' },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to update customer');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update customer'
            },
            { status: 500 }
        );
    }
}

// DELETE - Remove a customer
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Customer ID is required" },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Check if customer exists
        const [existingCustomer] = await db.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE id = ?`,
            [id]
        );

        if (existingCustomer.length == 0) {
            return NextResponse.json(
                { success: false, message: "Customer not found" },
                { status: 404 }
            );
        }

        // Delete customer
        const [result] = await db.query<ResultSetHeader>(
            `DELETE FROM customers WHERE id = ?`,
            [id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                { success: true, message: 'Customer deleted successfully' },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to delete customer');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete customer'
            },
            { status: 500 }
        );
    }
}