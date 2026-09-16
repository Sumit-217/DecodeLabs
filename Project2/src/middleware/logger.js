/**
 * Request & Latency Logger Middleware
 * Implements high-resolution timing via process.hrtime.bigint()
 */
export function requestLogger(req, res, next) {
  const startNanoseconds = process.hrtime.bigint();
  const timestamp = new Date().toISOString();

  // Listen for the response finish event to calculate elapsed time
  res.on('finish', () => {
    const endNanoseconds = process.hrtime.bigint();
    const durationMs = Number(endNanoseconds - startNanoseconds) / 1e6;
    const formattedDuration = `${durationMs.toFixed(2)}ms`;

    // Only log if not in silent test mode (or log at debug level)
    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_LOGS === 'true') {
      console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url} → ${res.statusCode} (${formattedDuration})`);
    }
  });

  next();
}
