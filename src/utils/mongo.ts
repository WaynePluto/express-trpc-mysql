export const findFilter = <T extends object>(data: Partial<T>) => {
  return Object.entries(data).reduce((acc, cur) => {
    const [k, v] = cur
    if (typeof v === 'string') {
      acc[k] = new RegExp(v)
    } else {
      acc[k] = v
    }
    return acc
  }, {})
}
