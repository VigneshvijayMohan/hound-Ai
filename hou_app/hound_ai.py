from openai import OpenAI
import os


client = OpenAI(api_key="")  

def get_completion(prompt, model="gpt-3.5-turbo"):
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
    )
    return response.choices[0].message.content


def hound_ai(selected_text, url):
    input_text = f"""
    Explain what "{selected_text}" refers to based on how it is described or used in the content at the URL: {url}. 
    Provide at least 50 words of informative text that accurately reflects the meaning, role, or significance of the term 
    according to the source. Do not include any phrases like 'in the context of the URL' or reference the prompt itself—just 
    give a clear, direct explanation based on the page.
    """
    response = get_completion(input_text)
    print(response)
    return response

