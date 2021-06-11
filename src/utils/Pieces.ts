const Pieces = {
  generate: (obj: any): any => {
    const pieces = {}
    function generatePiece (toObj: any, key: string, working?: string): void {
      const val = key ? toObj[key] : toObj
      if (typeof val !== 'object') {
        pieces[`${working ? `${working}.` : ''}${key}`] = val
      } else {
        Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`))
      }
    }
    generatePiece(obj, '')

    return pieces
  }
}

export default Pieces
