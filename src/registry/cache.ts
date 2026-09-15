import Conf from "conf";

const store = new Conf({
  projectName: "fonij",
});

export function saveRegistry(data: any) {
  store.set("registry", {
    data,
    timestamp: Date.now(),
  });
}

export function getCachedRegistry() {
  return store.get("registry") as
    | {
        data: any;
        timestamp: number;
      }
    | undefined;
}
