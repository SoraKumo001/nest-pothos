import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { builder } from './libs/builder';
import { ConfigModule } from '@nestjs/config';

const schema = builder.toSchema();

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      schema,
      context: ({ req }) => ({ req }),
    }),
  ],
})
export class AppModule {}
