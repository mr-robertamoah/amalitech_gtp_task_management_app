import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  validate(payload: { sub: string; username: string }) {
    // Here you can add additional validation logic if needed
    // For example, you can check if the user exists in the database
    // const user = await this.usersService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // If the user is valid, return the user object or any other data you want to attach to the request
    // return user;
    // For now, we will just return the payload
    // This will make the payload available in the request object
    return { userId: payload.sub, username: payload.username };
  }
}
