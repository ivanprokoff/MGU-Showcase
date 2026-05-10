import { Router } from "express";
import { db, widgetsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateWidgetBody, UpdateWidgetBody, GetWidgetParams, UpdateWidgetParams, DeleteWidgetParams } from "@workspace/api-zod";

const widgetsRouter = Router();

widgetsRouter.get("/widgets", async (req, res) => {
  const widgets = await db.select().from(widgetsTable).orderBy(widgetsTable.order, widgetsTable.id);
  res.json(widgets);
});

widgetsRouter.post("/widgets", async (req, res) => {
  const parsed = CreateWidgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }
  const { title, url, description, icon, order } = parsed.data;
  const [widget] = await db.insert(widgetsTable).values({
    title,
    url,
    description: description ?? null,
    icon: icon ?? null,
    order: order ?? 0,
  }).returning();
  res.status(201).json(widget);
});

widgetsRouter.get("/widgets/:id", async (req, res) => {
  const parsed = GetWidgetParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [widget] = await db.select().from(widgetsTable).where(eq(widgetsTable.id, parsed.data.id));
  if (!widget) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }
  res.json(widget);
});

widgetsRouter.put("/widgets/:id", async (req, res) => {
  const paramsParsed = UpdateWidgetParams.safeParse({ id: req.params.id });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateWidgetBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body", details: bodyParsed.error.issues });
    return;
  }
  const updates = bodyParsed.data;
  const setFields: Record<string, unknown> = {};
  if (updates.title !== undefined) setFields.title = updates.title;
  if (updates.url !== undefined) setFields.url = updates.url;
  if (updates.description !== undefined) setFields.description = updates.description;
  if (updates.icon !== undefined) setFields.icon = updates.icon;
  if (updates.order !== undefined) setFields.order = updates.order;
  if (updates.pinned !== undefined) setFields.pinned = updates.pinned;

  const [widget] = await db.update(widgetsTable)
    .set(setFields as any)
    .where(eq(widgetsTable.id, paramsParsed.data.id))
    .returning();
  if (!widget) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }
  res.json(widget);
});

widgetsRouter.delete("/widgets/:id", async (req, res) => {
  const parsed = DeleteWidgetParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await db.delete(widgetsTable).where(eq(widgetsTable.id, parsed.data.id)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Widget not found" });
    return;
  }
  res.status(204).send();
});

export default widgetsRouter;
