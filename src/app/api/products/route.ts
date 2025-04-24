import { connectionToDatabase } from '@/util/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new product
export async function POST(request: NextRequest) {
    try {
        const { user_id, product_id, name, description, price, category, stock, unit } = await request.json();

        if (!user_id || !product_id || !name || !description || !price || !category || !stock || !unit) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO products (user_id, product_id, name, description, price, category, stock, unit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, product_id, name, description, price, category, stock, unit]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json({ success: true, message: 'Product created' }, { status: 201 });
        } else {
            throw new Error('Failed to create product');
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error'
        }, { status: 500 });
    }
}

// GET - Retrieve product(s)
export async function GET(request: NextRequest) {
    try {
        const db = await connectionToDatabase();
        const user_id = request.headers.get('user_id');

        if (user_id) {
            const [product] = await db.query<RowDataPacket[]>(
                `SELECT * FROM products WHERE user_id = ?`,
                [user_id]
            );

            if (product.length == 0) {
                return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, data: product }, { status: 200 });
        }

        const [products] = await db.query<RowDataPacket[]>(`SELECT * FROM products`);
        return NextResponse.json({ success: true, data: products }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
    try {
        const { id, name, description, price, category, stock, unit } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const [existing] = await db.query<RowDataPacket[]>(
            `SELECT * FROM products WHERE id = ?`,
            [id]
        );

        if (existing.length == 0) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const [result] = await db.query<ResultSetHeader>(
            `UPDATE products
             SET name = ?, description = ?, price = ?, category = ?, stock = ?, unit = ?
             WHERE id = ?`,
            [name, description, price, category, stock, unit, id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json({ success: true, message: 'Product updated successfully' }, { status: 200 });
        } else {
            throw new Error('Failed to update product');
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update product'
        }, { status: 500 });
    }
}

// DELETE - Remove a product
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const [existing] = await db.query<RowDataPacket[]>(
            `SELECT * FROM products WHERE id = ?`,
            [id]
        );

        if (existing.length == 0) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const [result] = await db.query<ResultSetHeader>(
            `DELETE FROM products WHERE id = ?`,
            [id]
        );

        if (result.affectedRows == 1) {
            return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
        } else {
            throw new Error('Failed to delete product');
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete product'
        }, { status: 500 });
    }
}
