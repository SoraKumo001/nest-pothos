import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { builder } from './libs/builder';
import { ConfigModule } from '@nestjs/config';
import { prisma } from './libs/context';
import * as jsonwebtoken from 'jsonwebtoken';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import './libs/resolvers';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'cookie';

const schema = builder.toSchema();

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }),
      ],
      playground: false,
      driver: ApolloDriver,
      path: '/',
      introspection: true,
      schema,
      context: async ({
        req,
        res,
      }: {
        req: IncomingMessage;
        res: ServerResponse;
      }) => {
        const cookie = parse(req.headers.cookie ?? '');
        const token = cookie.session;
        const user = token
          ? await new Promise<
              { id: string; name: string; roles: string[] } | undefined
            >((resolve) => {
              jsonwebtoken.verify(token, 'test', (_, data) => {
                resolve(
                  typeof data === 'object'
                    ? (data.payload?.user as
                        | { name: string; id: string; roles: string[] }
                        | undefined)
                    : undefined,
                );
              });
            })
          : undefined;
        return { req: req, res: res, prisma, user };
      },
    }),
  ],
})
export class AppModule {}
