import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import type { Widget } from "@workspace/api-client-react";

const widgetSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  url: z.string().url("Введите корректный URL (напр. https://msu.ru)"),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.coerce.number().optional(),
});

type WidgetFormValues = z.infer<typeof widgetSchema>;

interface WidgetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget?: Widget;
  onSubmit: (values: WidgetFormValues) => void;
  isPending: boolean;
}

export function WidgetFormModal({ open, onOpenChange, widget, onSubmit, isPending }: WidgetFormModalProps) {
  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      icon: "",
      order: 0,
    },
  });

  useEffect(() => {
    if (open && widget) {
      form.reset({
        title: widget.title,
        url: widget.url,
        description: widget.description || "",
        icon: widget.icon || "",
        order: widget.order,
      });
    } else if (open && !widget) {
      form.reset({
        title: "",
        url: "",
        description: "",
        icon: "",
        order: 0,
      });
    }
  }, [open, widget, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[425px] max-h-[90dvh] overflow-y-auto rounded-2xl p-5 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg sm:text-xl">
            {widget ? "Редактировать виджет" : "Добавить виджет"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {widget ? "Внесите изменения в виджет ниже." : "Заполните форму для создания нового виджета."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-widget-title"
                      placeholder="Сайт МГУ"
                      className="h-11 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-widget-url"
                      placeholder="https://www.msu.ru"
                      inputMode="url"
                      className="h-11 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-widget-description"
                      placeholder="Главный сайт университета..."
                      className="text-base resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Иконка</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-widget-icon"
                        placeholder="🎓"
                        className="h-11 text-base text-center"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Порядок</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-widget-order"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        className="h-11 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 sm:flex-none"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Отмена
              </Button>
              <Button
                data-testid="button-submit-widget"
                type="submit"
                disabled={isPending}
                className="h-11 flex-1 sm:flex-none"
              >
                {isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
