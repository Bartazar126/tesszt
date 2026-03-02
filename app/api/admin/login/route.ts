import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const getJwtSecretKey = () => {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return '';
    return secret;
};

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const trueUser = process.env.ADMIN_USERNAME;
        const truePass = process.env.ADMIN_PASSWORD;

        if (!trueUser || !truePass) {
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        if (username === trueUser && password === truePass) {
            const token = await new SignJWT({ user: username })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(new TextEncoder().encode(getJwtSecretKey()));

            const response = NextResponse.json({ success: true }, { status: 200 });

            response.cookies.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
