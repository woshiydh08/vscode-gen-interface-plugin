# gen-interface-plugin README

帮你生成请求函数的入参和出参接口

## 用法

鼠标右击`.ts`后缀结尾的文件, 选择`生成`

文件格式需如下

```typescript
/** 你的函数A */
export const functionA = () => {

}

/** 你的函数B */
export const functionB = () => {

}
```

## 生成

使用以上操作后, 会在同级目录下生成

```typescript
/** 你的函数A参数 */
export interface FunctionARequest {

}

/** 你的函数A响应 */
export interface FunctionAResponse {

}

/** 你的函数B参数 */
export interface FunctionBRequest {

}

/** 你的函数B响应 */
export interface FunctionBResponse {

}

```
