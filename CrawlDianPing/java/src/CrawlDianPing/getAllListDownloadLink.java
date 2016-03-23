/**
 * 
 */
package CrawlDianPing;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONValue;
import net.minidev.json.parser.ParseException;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

/**
 * @author Administrator
 *
 */
public class getAllListDownloadLink
{

	/**
	 * 
	 */
	public getAllListDownloadLink()
	{
		// TODO 自动生成的构造函数存根
	}

	/**
	 * @param args
	 */
	public static void main(String[] args)throws IOException 
	{
		PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/AllCitysDealListDownLoadURL.txt"), true));
		printWriter.println("city,url");
		String apiUrl;
		String appKey = "";    
		String secret = "";
		Map<String, String> paramMap = new HashMap<String, String>();    
		StringBuilder stringBuilder = new StringBuilder();
		// 对参数名进行字典排序
		String[] keyArray = paramMap.keySet().toArray(new String[0]);
		Arrays.sort(keyArray);
		// 拼接有序的参数名-值串
		stringBuilder.append(appKey);
		for (String key : keyArray)
		{
			stringBuilder.append(key).append(paramMap.get(key));
		}
		String codes = stringBuilder.append(secret).toString();
		// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
		String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
		// 添加签名
		stringBuilder = new StringBuilder(); 
		stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
		for (Entry<String, String> entry : paramMap.entrySet())
		{
			stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
		}
		String queryString = stringBuilder.toString();	        
		apiUrl="http://api.dianping.com/v1/deal/get_all_id_list_download_links?"+queryString;
		CloseableHttpClient httpclient = HttpClients.createDefault();  
		try {  
			// 创建httpget.    
			HttpGet httpget = new HttpGet(apiUrl);  
			System.out.println("executing request " + httpget.getURI());  
			// 执行get请求.    
			CloseableHttpResponse response = httpclient.execute(httpget);  
			try {  
				// 获取响应实体    
				HttpEntity entity = response.getEntity();  
				System.out.println("--------------------------------------");  
				// 打印响应状态    
				System.out.println(response.getStatusLine());  
				if (entity != null) {  
					// 打印响应内容长度    
					System.out.println("Response content length: " + entity.getContentLength());  
					// 打印响应内容    
					Map<String, Object> map = null;
					String content=EntityUtils.toString(entity);
					try
					{
						map = (Map<String, Object>) JSONValue.parseStrict(content);
					}
					catch (ParseException e)
					{
						// TODO 自动生成的 catch 块
						e.printStackTrace();
					}

					//Object obj=JSONValue.parse(content);
					String status= (String) map.get("status");							                 
					if (status.equals("OK"))
					{
						int count=(int)map.get("count");
						System.out.println(count);
						JSONArray total_categories = (JSONArray) map.get("download_links");
						for(int i=0;i<total_categories.size();i++){
							Map<String, Object> categories=(Map<String, Object>)total_categories.get(i);
							String cityname=(String)categories.get("city");  //城市
							String downloadurl=(String) categories.get("url");
							printWriter.println(cityname+","+downloadurl);
						}
						printWriter.close();
					}else{
						System.out.println(content);
						printWriter.close();
					}
				}
			}
			finally {  
					response.close();  
			}  
		}catch (ClientProtocolException e) {  
			e.printStackTrace();  
		} catch (IOException e) {  
			e.printStackTrace();  
		} finally { 
			// 关闭连接,释放资源    
			try {  
				httpclient.close();  
			} catch (IOException e) {  
				e.printStackTrace();  
			}  
		}
	}
}

