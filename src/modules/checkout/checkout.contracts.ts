import type { OrderPreview } from './checkout.types';
import type { CheckoutPreviewDto } from './checkout.dto';

export interface ICheckoutService {
  previewOrder(userId: string, dto: CheckoutPreviewDto): Promise<OrderPreview>;
}
