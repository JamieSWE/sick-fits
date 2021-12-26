import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, // tells Apollo we will take care of everything
    read(existing = [], { args, cache }) {
      console.log({ existing, args, cache });
      const { skip, first } = args;
      // Read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      // Check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);

      // if there are items AND there aren't enough items to satisfy how many we
      // request and we're on the last page THEN JUST SEND IT
      if (items.length && items.length !== first && page === pages) {
        return items;
      }
      if (items.length !== first) {
        // We don't have any items and we must go to the netwoprk and fetch them
        return false;
      }

      // If there are items, return them without going to the network
      if (items.length) {
        console.log(
          `There are ${items.length} items in the cache! Gonna send them to Apollo.`
        );
        return items;
      }
      return false; // fallback to network
    },
    merge(existing, incoming, { args }) {
      // This runs when the Apollo client returns from the network with our product
      const { skip, first } = args;
      console.log(`Merging items from the network ${incoming.length}`);
      const merged = existing ? existing.slice(0) : [];

      for (let i = skip; i < skip + incoming.length; i++) {
        merged[i] = incoming[i - skip];
      }
      console.log(merged);
      // Finally return the merged items from the cache
      return merged;
    },
  };
}
