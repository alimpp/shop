import { JwtModuleOptions } from '@nestjs/jwt';
import { registerAs } from '@nestjs/config';

const DEV_FALLBACK_SECRET =
  '3914867ec115657ba9acdc3950c39442a72d55df1293ff23afe9cb115dcda69d';

function resolveJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is required in production. Set it in Liara environment variables.',
    );
  }

  return DEV_FALLBACK_SECRET;
}

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: resolveJwtSecret(),
    signOptions: {
      expiresIn: '7d',
    },
  }),
);
