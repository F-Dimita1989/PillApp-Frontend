import * as ImageManipulator from "expo-image-manipulator";

export async function preprocessImageForOcr(uri: string): Promise<string[]> {
  const variants = new Set<string>();
  variants.add(uri);

  const [largeJpeg, mediumPng] = await Promise.all([
    ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 2400 } }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    ),
    ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1800 } }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
      },
    ),
  ]);

  variants.add(largeJpeg.uri);
  variants.add(mediumPng.uri);

  return [...variants];
}
