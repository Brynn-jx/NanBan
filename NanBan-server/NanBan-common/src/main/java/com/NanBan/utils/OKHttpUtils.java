package com.NanBan.utils;

import com.NanBan.entity.enums.ResponseCodeEnum;
import com.NanBan.exception.BusinessException;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class OKHttpUtils {
    /**
     * 请求超时时间5秒
     */
    private static final int TIME_OUT_SECONDS = 5;

    private static Logger logger = LoggerFactory.getLogger(OKHttpUtils.class);

    private static OkHttpClient.Builder getCilentBuilder() {
        OkHttpClient.Builder clientBuilder = new OkHttpClient.Builder().followRedirects(false).retryOnConnectionFailure(false);
        clientBuilder.connectTimeout(TIME_OUT_SECONDS, TimeUnit.SECONDS).readTimeout(TIME_OUT_SECONDS, TimeUnit.SECONDS);
        return clientBuilder;
    }

    private static Request.Builder getRequestBuilder(Map<String, String> header) {
        Request.Builder requestBuilder = new Request.Builder();
        if (header != null) {
            for (Map.Entry<String, String> map : header.entrySet()) {
                String key = map.getKey();
                String value;
                if (map.getValue() == null) {
                    value = "";
                }else {
                    value = map.getValue();
                }
                requestBuilder.addHeader(key, value);
            }
        }
        return requestBuilder;
    }

    private static FormBody.Builder getBuilder(Map<String, String>params){
        FormBody.Builder builder = new FormBody.Builder();
        if(params == null){
            return builder;
        }
        for(Map.Entry<String, String>map : params.entrySet()){
            String key = map.getKey();
            String value;
            if(map.getValue() == null){
                value="";
            }else{
                value = map.getValue();
            }
            builder.add(key, value);
        }
        return builder;
    }

    public static String getRequest(String url) throws BusinessException {
        ResponseBody responseBody = null;
        try {
            OkHttpClient.Builder clientBuilder = getCilentBuilder();
            Request.Builder requestBuilder = getRequestBuilder(null);
            OkHttpClient client = clientBuilder.build();
            Request request = requestBuilder.url(url).build();
            Response response = client.newCall(request).execute();
            responseBody = response.body();
            return responseBody.string();
        }catch (SocketTimeoutException | ConnectException e){
            logger.error("OKHttp POST 请求超时,url:{}", url, e);
            throw new BusinessException(ResponseCodeEnum.CODE_900);
        }catch (Exception e){
            logger.error("OKHttp GET 请求异常", e);
            return null;
        }finally {
            if(responseBody != null){
                responseBody.close();
            }
        }
    }

//    public static String postRequest(String url, Map<String, String> header, Map<String, String>params)throws BusinessException{
//        ResponseBody responseBody = null;
//        try {
//            OkHttpClient.Builder clientBuilder = getCilentBuilder();
//            Request.Builder requestBuilder = getRequestBuilder(header);
//            FormBody.Builder builder = getBuilder(params);
//            OkHttpClient client = clientBuilder.build();
//            RequestBody requestBody = builder.build();
//            Request request = requestBuilder.url(url).post(requestBody).build();
//            Response response = client.newCall(request).execute();
//            responseBody = response.body();
//            String responseStr = responseBody.string();
//            return responseStr;
//        }catch (SocketTimeoutException | ConnectException e){
//            logger.error("OKHttp POST 请求超时,url:{}", url, e);
//            throw new BusinessException(ResponseCodeEnum.CODE_900);
//        }catch (Exception e){
//            logger.error("OKHttp POST 请求异常", e);
//            return null;
//        }finally {
//            if(responseBody != null){
//                responseBody.close();
//            }
//        }
//    }
}

//class RedirectInterceptor implements Interceptor{
//    private static Logger logger = LoggerFactory.getLogger(RedirectInterceptor.class);
//
//    @Override
//    public Response intercept(Chain chain) throws IOException {
//        Request request = chain.request();
//        Response response = chain.proceed(request);
//        int code = response.code();
//        if(code == 307 || code == 301 || code == 302){
//            // 获取重定向的地址
//            String location = response.headers().get("Location");
//            logger.info("重定向地址,location:{}", location);
//            // 重新构建请求
//            Request newRequest = request.newBuilder().url(location).build();
//            response = chain.proceed(newRequest);
//        }
//        return response;
//    }
//}
