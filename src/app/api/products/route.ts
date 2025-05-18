import { connectionToDatabase } from '@/util/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const products = body.products;

        if (!Array.isArray(products)) {
            return NextResponse.json(
                { success: false, error: 'Expected an array of products' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();
        const insertValues: any[] = [];

        for (const product of products) {
            const {
                user_id,
                product_id,
                name,
                description,
                price,
                buying_price,
                category,
                stock,
                unit,
                type,
                sku,
                purchaser,
                attribute
            } = product;

            if (!user_id || !product_id || !name || !price || !buying_price ||
                !category || stock == null || !unit || !type || !sku) {
                console.error('Missing required fields in product:', product);
                return NextResponse.json(
                    { success: false, error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            const purchaserData = purchaser
                ? JSON.stringify(purchaser)
                : JSON.stringify({});

            const attributeData = Array.isArray(attribute)
                ? JSON.stringify(attribute)
                : JSON.stringify([]);

            const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
            const numericBuyingPrice = typeof buying_price === 'string'
                ? parseFloat(buying_price)
                : buying_price;

            insertValues.push([
                user_id,
                product_id,
                name,
                description || '',
                numericPrice,
                numericBuyingPrice,
                category,
                stock,
                unit,
                type,
                sku,
                purchaserData,
                attributeData
            ]);
        }

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO products 
             (user_id, product_id, name, description, price, buying_price, 
              category, stock, unit, type, sku, purchaser, attribute)
             VALUES ${insertValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
            insertValues.flat()
        );

        return NextResponse.json(
            { success: true, message: `${result.affectedRows} product(s) created` },
            { status: 201 }
        );

    } catch (error) {
        console.error('[ERROR in POST /api/products]', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Database operation failed' },
            { status: 500 }
        );
    }
}

// GET - Retrieve product(s)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

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
        const { id, product_id } = await request.json();

        if (!id && !product_id) {
            return NextResponse.json(
                { success: false, message: 'Either id or product_id is required' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        if (id) {
            // Handle single delete by id
            const [existing] = await db.query<RowDataPacket[]>(
                `SELECT * FROM products WHERE id = ?`,
                [id]
            );

            if (existing.length === 0) {
                return NextResponse.json(
                    { success: false, message: 'Product not found' },
                    { status: 404 }
                );
            }

            const [result] = await db.query<ResultSetHeader>(
                `DELETE FROM products WHERE id = ?`,
                [id]
            );

            return result.affectedRows === 1
                ? NextResponse.json(
                    { success: true, message: 'Product deleted successfully' },
                    { status: 200 }
                )
                : NextResponse.json(
                    { success: false, message: 'Failed to delete product' },
                    { status: 500 }
                );

        } else if (product_id) {
            // Handle delete by product_id (single or multiple)
            const productIds = Array.isArray(product_id) ? product_id : [product_id];
            const placeholders = productIds.map(() => '?').join(',');

            const [result] = await db.query<ResultSetHeader>(
                `DELETE FROM products WHERE product_id IN (${placeholders})`,
                productIds
            );

            return result.affectedRows > 0
                ? NextResponse.json(
                    { success: true, message: `${result.affectedRows} product(s) deleted successfully` },
                    { status: 200 }
                )
                : NextResponse.json(
                    { success: false, message: 'No products found to delete' },
                    { status: 404 }
                );
        }

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete product'
            },
            { status: 500 }
        );
    }
}
