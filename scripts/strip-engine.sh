rm -rf .github
rm -rf .vscode
rm -rf npx

for d in packages/* ; do
  rm -rf "$d/tests"
  rm -rf "$d/.gitignore"
  rm -rf "$d/.mocharc.js"
  rm -rf "$d/LICENSE"
  rm -rf "$d/README.md"
  rm -rf "$d/CHANGELOG.md"
  rm -rf "$d/typedoc.json"
  rm -rf "$d/declarations.d.ts"
done

rm -rf packages/client/android
rm -rf packages/client/ios
rm -rf packages/client/capacitor.config
rm -rf packages/ui/.storybook
rm -rf packages/ui/jest.config.ts
rm -rf packages/ui/babel.config.js