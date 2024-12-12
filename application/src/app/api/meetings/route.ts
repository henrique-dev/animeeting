import { NextRequest, NextResponse } from 'next/server';

const POST = async (_request: NextRequest) => {
  const id = crypto.randomUUID();

  return NextResponse.json({
    id,
  });
};

export { POST };
