const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', '@capacitor', 'android', 'capacitor', 'src', 'main', 'java', 'com', 'getcapacitor', 'AndroidProtocolHandler.java');

try {
  if (!fs.existsSync(target)) {
    console.log('patch-capacitor: target not found, skipping:', target);
    process.exit(0);
  }

  let src = fs.readFileSync(target, 'utf8');

  // Add import for android.util.Log
  if (!/import android.util.Log;/.test(src)) {
    src = src.replace(/import android.util.TypedValue;\s*/m, 'import android.util.TypedValue;\nimport android.util.Log;\n');
  }

  // Add TAG constant after class declaration if missing
  if (!/private static final String TAG =/.test(src)) {
    src = src.replace(/public class AndroidProtocolHandler \{\s*/m, 'public class AndroidProtocolHandler {\n\n    private static final String TAG = "AndroidProtocolHandler";\n\n');
  }

  // Replace Logger.error with Log.e
  src = src.replace(/Logger\.error\(([^;]*?)\);/g, function(m, p1) {
    return 'Log.e(TAG, ' + p1 + ');';
  });

  fs.writeFileSync(target, src, 'utf8');
  console.log('patch-capacitor: patched', target);
} catch (err) {
  console.error('patch-capacitor: failed', err);
  process.exit(1);
}
