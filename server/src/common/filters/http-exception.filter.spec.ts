import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter (monitoring)', () => {
  const filter = new HttpExceptionFilter();

  function createHost(statusSpy = jest.fn().mockReturnThis(), jsonSpy = jest.fn()) {
    return {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusSpy.mockReturnValue({ json: jsonSpy }),
        }),
        getRequest: () => ({
          method: 'GET',
          url: '/orders',
          user: { sub: 'user-1' },
        }),
      }),
    } as any;
  }

  it('formats http exception responses', () => {
    const statusSpy = jest.fn().mockReturnThis();
    const jsonSpy = jest.fn();
    const host = createHost(statusSpy, jsonSpy);

    filter.catch(
      new HttpException('سفارش یافت نشد', HttpStatus.NOT_FOUND),
      host,
    );

    expect(statusSpy).toHaveBeenCalledWith(404);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        message: 'سفارش یافت نشد',
        path: '/orders',
        data: null,
      }),
    );
  });

  it('maps unknown errors to 500', () => {
    const statusSpy = jest.fn().mockReturnThis();
    const jsonSpy = jest.fn();
    const host = createHost(statusSpy, jsonSpy);

    filter.catch(new Error('boom'), host);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: 'خطای داخلی سرور',
      }),
    );
  });
});
