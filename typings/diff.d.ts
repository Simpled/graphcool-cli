export = JsDiff;
export as namespace JsDiff;

declare namespace JsDiff {
  function diffLines(a: string, b: string): LineDiff[];

  interface LineDiff {
    count: number
    value: string
    added?: boolean
    removed?: boolean
  }
}