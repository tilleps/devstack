/**
 * Custom express
 */
import express from "express";

/**
 * Monkey patch Express to support exceptions being thrown in middleware
 * Remove after Express >= 5.0
 */
import "express-async-errors";

/**
 * @type {express.Application}
 */
export default express;
