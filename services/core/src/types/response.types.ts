import type { Request, Response } from "express";

export type TFieldError = {
    field: string;
    message: string;
};

export type TSuccessResponse<T> = {
    success: true;
    message: string;
    data: T;
};

export type TErrorResponse = {
    success: false;
    message: string;
    data: null;
    errorCode: string;
    errors: TFieldError[];
    traceId: string;
};

export type TApiResponse<T> = TSuccessResponse<T> | TErrorResponse;

export type TSuccessResponseOptions<T> = {
    res: Response<TSuccessResponse<T>>;
    message: string;
    data: T;
    statusCode?: number;
};

export type TErrorResponseOptions = {
    req: Request;
    res: Response<TErrorResponse>;
    errorCode: string;
    message: string;
    errors?: TFieldError[];
    statusCode?: number;
};
