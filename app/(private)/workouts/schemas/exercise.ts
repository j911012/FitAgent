import { z } from 'zod';

const BODY_PARTS = ['chest', 'back', 'shoulder', 'arm', 'leg', 'abs'] as const;

export const exerciseSchema = z.object({
  name: z
    .string()
    .min(1, '種目名を入力してください')
    .max(50, '種目名は50文字以内で入力してください'),
  body_part: z.enum(BODY_PARTS, { error: '部位を選択してください' }),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
