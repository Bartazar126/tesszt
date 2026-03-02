import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || secret.length === 0) {
        throw new Error('The environment variable ADMIN_SECRET is not set.');
    }
    return secret;
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin routes (except login api and page)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/api/admin/login') {
        const token = request.cookies.get('admin_session')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const verified = await jwtVerify(
                token,
                new TextEncoder().encode(getJwtSecretKey())
            );
            // Valid token! Let them pass.
            return NextResponse.next();
        } catch (err) {
            // Invalid token! Redirect to login.
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
