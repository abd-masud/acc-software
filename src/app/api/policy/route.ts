import { connectionToDatabase } from '@/util/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new policy record
export async function POST(request: NextRequest) {
    try {
        const { terms, privacy, refund } = await request.json();
        const user_id = request.headers.get('user_id');

        if (!user_id) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO policy (user_id, terms, privacy, refund)
             VALUES (?, ?, ?, ?)`,
            [user_id, terms, privacy, refund]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json({ success: true, message: 'Record created successfully' }, { status: 201 });
        } else {
            throw new Error('Failed to create record');
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error'
        }, { status: 500 });
    }
}

// GET - Retrieve policy record(s)
export async function GET(request: NextRequest) {
    try {
        const db = await connectionToDatabase();
        const user_id = request.headers.get('user_id');

        if (user_id) {
            const [record] = await db.query<RowDataPacket[]>(
                `SELECT * FROM policy WHERE user_id = ?`,
                [user_id]
            );

            if (record.length == 0) {
                return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, data: record }, { status: 200 });
        }

        const [allRecords] = await db.query<RowDataPacket[]>(`SELECT * FROM policy`);
        return NextResponse.json({ success: true, data: allRecords }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT - Update a policy record
export async function PUT(request: NextRequest) {
    try {
        const { terms, privacy, refund } = await request.json();
        const user_id = request.headers.get('user_id');

        if (!user_id) {
            return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const [existing] = await db.query<RowDataPacket[]>(
            `SELECT * FROM policy WHERE user_id = ?`,
            [user_id]
        );

        if (existing.length == 0) {
            return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
        }

        const [result] = await db.query<ResultSetHeader>(
            `UPDATE policy
             SET terms = ?, privacy = ?, refund = ?
             WHERE user_id = ?`,
            [terms, privacy, refund, user_id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json({ success: true, message: 'Record updated successfully' }, { status: 200 });
        } else {
            throw new Error('Failed to update record');
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error'
        }, { status: 500 });
    }
}
