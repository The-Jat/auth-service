import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  // src/auth/auth.service.ts
async signup(email: string, password: string) {
  const client = await this.pool.connect();
  try {
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (existing.rowCount) throw new Error('User already exists');

    const hashed = await bcrypt.hash(password, 10);

    const result = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hashed],
    );

    const userId = result.rows[0].id;

    // Generate JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    return { token };
  } finally {
    client.release();
  }
}

  async login(email: string, password: string) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT id, password_hash FROM users WHERE email = $1',
        [email],
      );
      if (!result.rowCount) throw new Error('Invalid credentials');

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) throw new Error('Invalid credentials');

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });

      return { token };
    } finally {
      client.release();
    }
  }
}
