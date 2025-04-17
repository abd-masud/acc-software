import { connectionToDatabase } from '@/util/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

// POST - Create a new employee
export async function POST(request: NextRequest) {
    try {
        const { user_id, name, email, contact, department, role, status, password } = await request.json();

        // Basic validation
        if (!user_id || !name || !email || !contact || !department || !role || !status || !password) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Hash the password with bcrypt (using 10 salt rounds)
        const hashedPassword = await hash(password, 10);

        const db = await connectionToDatabase();

        // Insert new employee
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO employees (user_id, name, email, contact, department, role, status, password)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, email, contact, department, role, status, hashedPassword]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Employee created successfully',
                    customerId: result.insertId
                },
                { status: 201 }
            );
        } else {
            throw new Error('Failed to create employee');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create employee'
            },
            { status: 500 }
        );
    }
}

// GET - Retrieve employees
export async function GET(request: NextRequest) {
    try {
        const db = await connectionToDatabase();
        const user_id = request.headers.get('user_id');

        // If employee ID is provided
        if (user_id) {
            const [employees] = await db.query<RowDataPacket[]>(
                `SELECT * FROM employees WHERE user_id = ?`,
                [user_id]
            );

            if (employees.length == 0) {
                return NextResponse.json(
                    { success: false, message: "Employee not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: employees },
                { status: 200 }
            );
        }

        // If no employee ID provided, fetch all employees
        const [employees] = await db.query<RowDataPacket[]>(
            `SELECT * FROM employees`
        );

        return NextResponse.json(
            { success: true, data: employees },
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

// PUT - Update a employee
export async function PUT(request: NextRequest) {
    try {
        const { id, name, email, contact, department, role, status, password } = await request.json();

        const db = await connectionToDatabase();

        // Check if employee exists
        const [existingCustomer] = await db.query<RowDataPacket[]>(
            `SELECT * FROM employees WHERE id = ?`,
            [id]
        );

        if (existingCustomer.length == 0) {
            return NextResponse.json(
                { success: false, message: "Employee not found" },
                { status: 404 }
            );
        }

        // Check if email is being used by another employee
        const [emailCheck] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count FROM employees WHERE email = ? AND id != ?`,
            [email, id]
        );

        if (emailCheck[0]?.count > 0) {
            return NextResponse.json(
                { success: false, message: "Email already in use by another employee" },
                { status: 400 }
            );
        }

        // Hash the new password if it's provided
        let hashedPassword = existingCustomer[0].password;
        if (password) {
            hashedPassword = await hash(password, 10);
        }

        // Update employee
        const [result] = await db.query<ResultSetHeader>(
            `UPDATE employees 
             SET name = ?, email = ?, contact = ?, department = ?, role =?, status =?, password =?
             WHERE id = ?`,
            [name, email, contact, department, role, status, hashedPassword, id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                { success: true, message: 'Employee updated successfully' },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to update employee');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update employee'
            },
            { status: 500 }
        );
    }
}

// DELETE - Remove a employee
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Employee ID is required" },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Check if employee exists
        const [existingCustomer] = await db.query<RowDataPacket[]>(
            `SELECT * FROM employees WHERE id = ?`,
            [id]
        );

        if (existingCustomer.length == 0) {
            return NextResponse.json(
                { success: false, message: "Employee not found" },
                { status: 404 }
            );
        }

        // Delete employee
        const [result] = await db.query<ResultSetHeader>(
            `DELETE FROM employees WHERE id = ?`,
            [id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json(
                { success: true, message: 'Employee deleted successfully' },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to delete employee');
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete employee'
            },
            { status: 500 }
        );
    }
}