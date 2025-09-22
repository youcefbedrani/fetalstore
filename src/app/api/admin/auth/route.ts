import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Strong admin password (you should change this to a secure password)
const ADMIN_PASSWORD_HASH = '$2a$12$wuG2mQrwgbZfWFdDha8OX.DjZ1M2V3CsgrTfc/Gga4C.Tmx5LvabG';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
