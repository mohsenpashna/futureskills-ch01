import { describe, it, expect, vi } from 'vitest';
import routeProductPage from './logic';

describe('routeProductPage', () => {
  it('should redirect to /login if not logged in', () => {
    const req = {
      session: {
        loggedIn: false,
      },
      body: {
        username: 'admin',
        password: 'admin',
      },
    };
    const res = {
      redirect: vi.fn(),
      end: vi.fn(),
    };

    routeProductPage(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(res.end).toHaveBeenCalled();
  });

  it('should render products page if logged in', () => {
    const req = {
      session: {
        loggedIn: true,
      },
      body: {
        username: 'admin',
        password: 'admin',
      },
    };
    const res = {
      render: vi.fn(),
    };

    routeProductPage(req, res);

    expect(res.render).toHaveBeenCalledWith('products');
    expect(req.session.loggedIn).toBe(true);
  });
});
