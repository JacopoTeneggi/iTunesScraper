import { Request, Response } from "express";

export let index = (req: Request, res: Response) => {
    res.send("<h1>Scraper home</h1>");
};

export default index;