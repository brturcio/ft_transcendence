import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";
import { logger } from "../logger/logger";

type Handler<T = unknown> = () => Promise<T>;

export async function handleRoute<T>(handler: Handler<T>) {
  try {
    const result = await handler();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Validation error", error.flatten());
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (error instanceof AppError) {
      logger.warn("Application error", {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
      });
      return NextResponse.json(
        {
          error: error.code,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }


    logger.error("Unhandled error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}
