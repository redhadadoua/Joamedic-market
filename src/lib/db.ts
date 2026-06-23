import { getDocs, query, collection, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Order } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', errInfo);
  throw new Error(JSON.stringify(errInfo));
}

// Order helpers
export async function createOrder(orderData: Omit<Order, 'id'>) {
  const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const path = `orders/${orderId}`;
  try {
    const fullOrder: Order = { ...orderData, id: orderId };
    await setDoc(doc(db, 'orders', orderId), fullOrder);
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getOrders(userId?: string): Promise<Order[]> {
  try {
    const q = userId 
      ? query(collection(db, 'orders'), /* where('userId', '==', userId) - requires index, omitting for ease for now or applying client side */) 
      : query(collection(db, 'orders'));
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => d.data() as Order);
    
    // Fallback filter if index is not ready
    if (userId) {
       return orders.filter(o => o.userId === userId);
    }
    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string) {
  try {
    const updateData: any = { status };
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    await updateDoc(doc(db, 'orders', orderId), updateData);
  } catch(error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}
