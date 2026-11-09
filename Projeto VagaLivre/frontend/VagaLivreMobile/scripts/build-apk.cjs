const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

if (process.platform !== 'win32') {
  console.error('Este atalho usa o Gradle do Windows. Em outro sistema, execute ./gradlew assembleHomologacao em android/.');
  process.exit(1);
}

const javaCandidates = [process.env.JAVA_HOME, path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Android', 'Android Studio', 'jbr')].filter(Boolean);
const javaHome = javaCandidates.find(candidate => fs.existsSync(path.join(candidate, 'bin', 'java.exe')));
const sdkCandidates = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')].filter(Boolean);
const sdkHome = sdkCandidates.find(candidate => fs.existsSync(path.join(candidate, 'platform-tools', 'adb.exe')));

if (!javaHome || !sdkHome) {
  console.error('Configure o Java e o Android SDK antes de gerar o APK. Consulte frontend/README.md.');
  process.exit(1);
}

const result = spawnSync('cmd.exe', ['/d', '/s', '/c', 'gradlew.bat assembleHomologacao --max-workers=2'], {
  cwd: path.resolve(__dirname, '..', 'android'),
  env: {...process.env, JAVA_HOME: javaHome, ANDROID_HOME: sdkHome},
  stdio: 'inherit',
});
if (result.error) {console.error(result.error.message);}
process.exit(result.status ?? 1);
