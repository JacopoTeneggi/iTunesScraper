import { request, GenericHTTPResponse } from "./util/request";
import { lookup, iTunesLookupResponse } from "./lib/iTunes";
import { matchVendor, State } from "./lib/podcast";
import { query } from "./util/psql";


test("HTTP simple GET", async () => {
    let response: GenericHTTPResponse = await request("http://httpbin.org/get");
    expect(response.body.args).toEqual({});
});

test("iTunes API lookup", async () => {
    const response: iTunesLookupResponse = await lookup(73329284);
    expect(response.body.resultCount).toBe(1);
});

test("iTunes API empty lookup", async () => {
    const response: iTunesLookupResponse = await lookup(12345);
    expect(response.body.resultCount).toBe(0);
});

test("Vendor matching", () => {
    const vendors = require("./vendors.json");
    expect(matchVendor("http://spreaker.com", Object.keys(vendors), vendors)).toBe("SPREAKER");
});

test("Unknown vendor matching", () => {
    const vendors = require("./vendors.json");
    expect(matchVendor("http://notaknownvendor.io", Object.keys(vendors), vendors)).toBe("UNKNOWN");
});

// test("Reduce vendors", () => {
//     const podcast = new Podcast(0, null, null, null, null, null, null, null, null, null, [{ vendor: "vendor1", enclosure: "1" }, { vendor: "vendor2", enclosure: "2" }]);
//     expect(podcast.reducedVendors).toEqual(["vendor1", "vendor2"]);
// });

test("Invalid SQL query", async () => { query("NOT AN SQL QUERY;").catch(reason => expect(!reason).toBe(false)); });