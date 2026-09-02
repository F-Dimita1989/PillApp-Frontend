import * as ImageManipulator from "expo-image-manipulator";

/**
 * Genera varianti ad alta qualità per ML Kit.
 * L'originale resta il primo tentativo; JPEG 2400 e PNG 1800 coprono
 * foto troppo grandi o cifre AIC piccole sulla confezione.
 */
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
