import tap from "tap";
import { convertBytes } from "./format.mjs";

tap.test("convertBytes", function (t) {
  const fileSizeInBytes = 2048;

  t.test("default conversion", function (t) {
    t.equal(convertBytes(fileSizeInBytes), "2.05 KB", "should convert to KB");
    t.equal(convertBytes(fileSizeInBytes * 1000), "2.05 MB", "should convert to MB");

    t.throws(function () {
      return convertBytes(fileSizeInBytes, { decimals: -1 });
    }, "should throw an error for invalid decimals");

    t.end();
  });

  t.test("conversion to binary units", function (t) {
    t.equal(
      convertBytes(fileSizeInBytes, { useBinaryUnits: true }),
      "2.00 KiB",
      "should convert to KiB"
    );
    t.equal(
      convertBytes(fileSizeInBytes * 1024, { useBinaryUnits: true }),
      "2.00 MiB",
      "should convert to MiB"
    );

    t.end();
  });

  t.equal(
    convertBytes(Number.MAX_SAFE_INTEGER),
    "9.01 PB",
    "should handle very large bytes (Number.MAX_SAFE_INTEGER)"
  );
  t.end();
});
