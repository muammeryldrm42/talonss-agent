 import { marketQuerySchema } from '@/lib/schemas/api';
import { getCoinMarketData } from '@/lib/market/service';
import { badRequest, serverError } from '@/lib/utils/http';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);

    const parsed = marketQuerySchema.safeParse({
      coinId: searchParams.get('coinId') ?? undefined,
      timeframe: searchParams.get('timeframe') ?? '1h',
    });

    if (!parsed.success) {
      return badRequest('Invalid market query.', parsed.error.flatten());
    }

    const market = await getCoinMarketData(
      symbol,
      parsed.data.timeframe,
      parsed.data.coinId,
    );

    return Response.json({ market });
  } catch (error) {
    return serverError(
      'Failed to load market data.',
      error instanceof Error ? error.message : undefined,
    );
  }
}
