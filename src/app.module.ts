import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { builder } from './libs/builder';
import { ConfigModule } from '@nestjs/config';
import { prisma } from './libs/context';
import jsonwebtoken from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

const schema = builder.toSchema();

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      playground: false,
      driver: ApolloDriver,
      schema,
      context: async ({ req, res }: { req: Request; res: Response }) => {
        const token = req.cookies?.session;
        const user = token
          ? await new Promise<{ id: string; name: string } | undefined>(
              (resolve) => {
                jsonwebtoken.verify(token, 'test', (_, data) => {
                  resolve(
                    typeof data === 'object'
                      ? (data?.payload?.user as
                          | { id: string; name: string }
                          | undefined)
                      : undefined,
                  );
                });
              },
            )
          : undefined;
        return { req, res, prisma, user };
      },
    }),
  ],
})
export class AppModule {}
