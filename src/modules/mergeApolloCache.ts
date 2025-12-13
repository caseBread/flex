import { NormalizedCacheObject } from "@apollo/client";
import deepmerge from "deepmerge";
import { isEqual } from "lodash-es";

export function mergeApolloCache(
  currentCache: NormalizedCacheObject,
  incomingCache: NormalizedCacheObject
): NormalizedCacheObject {
  return deepmerge(currentCache, incomingCache, {
    arrayMerge: (destinationArray, sourceArray) => [
      ...sourceArray,
      ...destinationArray.filter((d) =>
        sourceArray.every((s) => !isEqual(d, s))
      ),
    ],
  });
}
