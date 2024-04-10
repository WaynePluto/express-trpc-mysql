import { v5 as uuidv5 } from 'uuid'
/**
 * uuid v5 自定义命名空间
 *
 */
const UUIDSPACE = uuidv5.URL
/**
 * 使用自增id获取uuid
 * @param id
 * @returns
 */
export function getUUID(id: string | number) {
  return uuidv5(id.toString(), UUIDSPACE).replace(/-/g, '')
}
