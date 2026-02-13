from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage

class GroqLLM:
    def __init__(self, model_name: str = "meta-llama/llama-4-maverick-17b-128e-instruct", api_key: str =None):
        """
        Initialize Groq LLM

        Args:
            model_name: Groq model name (qwen2-72b-instruct, llama3-70b-8192, etc.)
            api_key: Groq API key (or set GROQ_API_KEY environment variable)
        """
        self.model_name = model_name
        self.api_key = api_key or os.environ.get("groq_api_key")

        if not self.api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable or pass api_key parameter.")

        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name=self.model_name,
            temperature=0.1,
            max_tokens=1024
        )

        print(f"Initialized Groq LLM with model: {self.model_name}")

    def generate_response(self, query: str, context: str, max_length: int = 500) -> str:
        """
        Generate response using retrieved context

        Args:
            query: User question
            context: Retrieved document context
            max_length: Maximum response length

        Returns:
            Generated response string
        """

        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""You are a helpful AI assistant specialized in Indian Tax Law.
First, carefully analyze the provided context and the user’s question.
Use the retrieved context as your primary reference.
Then, combine it with your own knowledge of Indian Tax Law to generate a clear, well-structured, and accurate answer.

If the context directly answers the question, explain it concisely.

If the context is incomplete or ambiguous, use your knowledge of Indian Tax Law to fill gaps while clearly indicating any assumptions.

If neither the context nor your knowledge is sufficient to answer, explicitly state that the available information is not enough

Context:
{context}

Question: {question}

Answer: Provide a clear and informative answer based on the context above. If the context doesn't contain enough information to answer the question, say so."""
        )

        # Format the prompt
        formatted_prompt = prompt_template.format(context=context, question=query)

        try:
            # Generate response
            messages = [HumanMessage(content=formatted_prompt)]
            response = self.llm.invoke(messages)
            return response.content

        except Exception as e:
            return f"Error generating response: {str(e)}"

    def generate_response_simple(self, query: str, context: str) -> str:
        """
        Simple response generation without complex prompting

        Args:
            query: User question
            context: Retrieved context

        Returns:
            Generated response
        """
        simple_prompt = f"""Based on this context: {context}

Question: {query}

Answer:"""

        try:
            messages = [HumanMessage(content=simple_prompt)]
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Error: {str(e)}"