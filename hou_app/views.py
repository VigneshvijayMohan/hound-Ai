from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .hound_ai import hound_ai


@csrf_exempt
def process_selection(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            selected_text = data.get('selection', '')
            url = data.get('url', '')
            
            # Process the text here
            # For example, you might run some analysis on the selected text
            # processed_text = f"Analysis of '{selected_text}' from {url}"
            processed_text = hound_ai(selected_text,url )
            print(processed_text)
            # Return a response
            return JsonResponse({
                'result': processed_text,
                'status': 'success'
            })
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'status': 'error'
            }, status=400)
    
    return JsonResponse({
        'error': 'Only POST requests are allowed',
        'status': 'error'
    }, status=405)

