import { describe, it, expect, vi } from 'vitest';
import { authenticateFn } from './logic';
import bcrypt from 'bcrypt';
const conn = require('./db');

vi.mock('./db', () => ({
  query: vi.fn(),
}));


describe('authenticate', () => {
  it('should redirect to /product if login is successful', async () => {
    const request = {
      body: { username: 'testuser', password: 'password' },
      session: {},
    };
    const response = {
      redirect: vi.fn(),
      end: vi.fn(),
    };

    const user = { username: 'testuser', password: bcrypt.hashSync('password', 10) };
    conn.query.mockImplementation((query, values, callback) => {
      callback(null, [user]);
    });

    await authenticateFn(request, response);

    expect(response.redirect).toHaveBeenCalledWith('/product');
    expect(request.session.username).toBe('testuser');
    expect(request.session.loggedIn).toBe(true);
  });

  it('should redirect to /login if password does not match', async () => {
    const request = {
      body: { username: 'testuser', password: 'wrongpassword' },
      session: {},
    };
    const response = {
      redirect: vi.fn(),
      end: vi.fn(),
    };

    const user = { username: 'testuser', password: bcrypt.hashSync('password', 10) };
    conn.query.mockImplementation((query, values, callback) => {
      callback(null, [user]);
    });

    await authenticateFn(request, response);

    expect(response.redirect).toHaveBeenCalledWith('/login');
  });

  it('should send "User not found" if user does not exist', async () => {
    const request = {
      body: { username: 'nonexistentuser', password: 'password' },
      session: {},
    };
    const response = {
      send: vi.fn(),
    };

    conn.query.mockImplementation((query, values, callback) => {
      callback(null, []);
    });

    await authenticateFn(request, response);

    expect(response.send).toHaveBeenCalledWith('User not found');
  });

  it('should throw an error if there is a database error', async () => {
    const request = {
      body: { username: 'testuser', password: 'password' },
      session: {},
    };
    const response = {
      send: vi.fn(),
    };

    conn.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'), null);
    });

    expect(() => authenticateFn(request, response)).toThrow('Database error');
  });
});
