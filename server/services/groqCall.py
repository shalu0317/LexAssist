from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from server.services.configuration import get_api_key

def call_llm_for_index_level(document):
  try:
    model_name = "meta-llama/llama-4-maverick-17b-128e-instruct"
    api_key = get_api_key()  # Implement this function to retrieve your API key securely
    llm = ChatGroq(
            groq_api_key=api_key,
            model_name=model_name,
            temperature=0.1,
            max_tokens=1024
        )
    
    prompt_template = PromptTemplate(
            input_variables=["content"],
            template="""You are a JSON filter generator for a vector database of Indian legal cases.

Your task: Read the user's query and output ONLY a valid JSON array of filter objects 
for an S3 vector search. Return **only valid JSON**, no explanations or extra text.

---

### Metadata Field Groups
These are shown only to help you understand which fields belong together logically.
Use this grouping when deciding if multiple fields can be combined in one filter.

1. **basic_info**
   - case_name, court_location, court_level, court_type, case_nature,
     outcome, decided_in_favor_of, decision_type, primary_category, domain

2. **parties_info**
   - appellant_name, appellant_type, respondent_name, respondent_type,
     respondent_department, assessee_won, revenue_won

3. **bench_info**
   - judges, authoring_judge, relief_granted, appellant_counsel,
     respondent_counsel, practice_areas, legal_areas,
     decision_factors, decision_reasoning

4. **section_info**
   - section_numbers, section_weights, section_types,
     primary_sections, primary_category, secondary_sections, sub_categories

5. **extra_info**
   - case_about_brief, issue_texts, issue_types, issue_weights,
     issue_categories, precedent_citations, procedural_stages

---
Only these operators are allowed in the filters:$eq, $in, $and, $or, $exists
 
### Output Format
Always return a **JSON array**.  
Each element represents one filter condition, or a logical combination ($and / $or) of fields 
**only from the same metadata group**.
Just output the resultant JSOn array and nothing else


✅ Examples

Separate filters (different groups):
[
  {{"section_numbers": {{"$in": ["153A"]}}}},
  {{"assessee_won": {{"$eq": true}}}}
]

Combined filter (same group – both from parties_info):

[
  {{"$and": [
    {{"assessee_won": {{"$eq": true}}}},
    {{"appellant_type": {{"$eq": "individual"}}}}
  ]}}
]

Multiple groups in one query → multiple filters in the array:

[
  {{"$and": [
    {{"assessee_won": {{"$eq": true}}}},
    {{"appellant_type": {{"$eq": "individual"}}}}
  ]}},
  {{"section_numbers": {{"$in": ["153A"]}}}}
]

If no filters are implied, return: [].

User query: "{query}"
""")

    formatted_prompt = prompt_template.format(query=document)
    # print("============formatted_prompt=================")
    # print(formatted_prompt)
            # Generate response
    messages = [HumanMessage(content=formatted_prompt)]
    response = llm.invoke(messages)
    responsellm = response.content

    # print(responsellm)

    # with open("output.txt", "w", encoding="utf-8") as f:
    #     f.write(responsellm)
    return responsellm

  except Exception as e:
        print( f"Error generating response: {str(e)}")


